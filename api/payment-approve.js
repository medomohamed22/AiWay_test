import { allowMethods, appError, db, fetchWithTimeout, handleError, json, localize, getPaymentPackage, piApiError, requestLocale, requireUser, requestIp, enforceRateLimit, verifyPaymentQuote, assertFeatureEnabled, assertUserCapability } from './_lib.js';

const piHeaders = () => ({ Authorization: `Key ${process.env.PI_SECRET_KEY}`, 'Content-Type': 'application/json' });
const norm = value => String(value || '').trim();
const amountMatches = (a,b) => {
  const x=Number(a),y=Number(b);
  return Number.isFinite(x)&&Number.isFinite(y)&&x>0&&y>0&&Math.abs(x-y)<=0.00000011;
};
async function getPiPayment(paymentId){
  const response=await fetchWithTimeout(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}`,{headers:piHeaders()},20000);
  const data=await response.json().catch(()=>null);
  if(!response.ok) throw piApiError(response.status,data,{operation:'payment'});
  return data;
}
function paymentOwner(remote){return norm(remote?.user_uid||remote?.user?.uid);}
function paymentPackage(remote){return norm(remote?.metadata?.packageId||remote?.metadata?.package_id);}
function remoteQuoteToken(remote){return norm(remote?.metadata?.quoteToken||remote?.metadata?.quote_token);}
async function validateStoredPayment(remote,user,payment,paymentId){
  const packageId=norm(payment.package_id);
  const pack=await getPaymentPackage(packageId,{includeInactive:true});
  if(!remote||!pack)throw appError('PAYMENT_MISMATCH');
  const remoteId=norm(remote.identifier||remote.payment_id);if(remoteId&&remoteId!==norm(paymentId))throw appError('PAYMENT_MISMATCH');
  if(paymentPackage(remote)!==packageId)throw appError('PAYMENT_MISMATCH');
  if(paymentOwner(remote)!==norm(user.pi_uid))throw appError('PAYMENT_MISMATCH');
  if(Number(remote?.metadata?.usd)!==Number(payment.usd_amount)||Number(remote?.metadata?.tokens)!==Number(payment.ai_tokens))throw appError('PAYMENT_MISMATCH');
  if(!amountMatches(remote?.amount,payment.amount_pi))throw appError('PAYMENT_MISMATCH');
}
async function validateNewPayment(remote,user,quote,paymentId,quoteToken){
  if(!remote)throw appError('PAYMENT_MISMATCH');
  const remoteId=norm(remote.identifier||remote.payment_id);if(remoteId&&remoteId!==norm(paymentId))throw appError('PAYMENT_MISMATCH');
  if(paymentPackage(remote)!==quote.packageId)throw appError('PAYMENT_MISMATCH');
  if(paymentOwner(remote)!==norm(user.pi_uid))throw appError('PAYMENT_MISMATCH');
  if(Number(remote?.metadata?.usd)!==quote.usd||Number(remote?.metadata?.tokens)!==quote.tokens)throw appError('PAYMENT_MISMATCH');
  if(remoteQuoteToken(remote)!==quoteToken)throw appError('PAYMENT_MISMATCH');
  if(!amountMatches(remote?.amount,quote.amountPi))throw appError('PAYMENT_MISMATCH');
}
async function readExisting(supabase,paymentId){
  const result=await supabase.from('payments').select('*').eq('payment_id',paymentId).maybeSingle();
  if(result.error)throw appError('DATABASE_ERROR',{},result.error);
  return result.data||null;
}

export default async function handler(req,res){
  if(!allowMethods(req,res,['POST'])) return;
  const locale=requestLocale(req);
  try{
    const user=await requireUser(req);
    await assertFeatureEnabled('payments');
    await assertUserCapability(user.id,'payment');
    await enforceRateLimit(db(),`payment:${user.id}:${requestIp(req)}`,12,60);
    const paymentId=norm(req.body?.paymentId);
    const requestedPackage=norm(req.body?.packageId);
    const quoteToken=norm(req.body?.quoteToken);
    if(!paymentId||!requestedPackage)throw appError('PAYMENT_INVALID');
    if(!process.env.PI_SECRET_KEY)throw appError('MISSING_CONFIGURATION');

    const supabase=db();
    const existing=await readExisting(supabase,paymentId);
    const remote=await getPiPayment(paymentId);
    if(existing){
      if(norm(existing.user_id)!==norm(user.id)||norm(existing.package_id)!==requestedPackage)throw appError('PAYMENT_MISMATCH');
      await validateStoredPayment(remote,user,existing,paymentId);
      return json(res,200,{approved:true,amountPi:Number(existing.amount_pi),alreadyApproved:true});
    }

    const requestedPack=await getPaymentPackage(requestedPackage);if(!requestedPack)throw appError('PAYMENT_INVALID');
    const quote=await verifyPaymentQuote(quoteToken);
    if(quote.packageId!==requestedPackage)throw appError('PAYMENT_MISMATCH');
    await validateNewPayment(remote,user,quote,paymentId,quoteToken);

    const response=await fetchWithTimeout(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`,{method:'POST',headers:piHeaders()},20000);
    const data=await response.json().catch(()=>null);
    if(!response.ok)throw piApiError(response.status,data,{operation:'payment'});

    const amountPi=quote.amountPi;
    const record={user_id:user.id,payment_id:paymentId,package_id:requestedPackage,amount_pi:amountPi,usd_amount:quote.usd,pi_usd_rate:Number((quote.usd/amountPi).toFixed(8)),ai_tokens:quote.tokens,status:'approved',raw_response:{approval:data,payment:remote,quote:{jti:quote.jti}}};
    const inserted=await supabase.from('payments').insert(record);
    if(inserted.error){
      if(/duplicate|unique/i.test(String(inserted.error.message||''))){
        const concurrent=await readExisting(supabase,paymentId);
        if(concurrent&&norm(concurrent.user_id)===norm(user.id)&&norm(concurrent.package_id)===requestedPackage){
          await validateStoredPayment(remote,user,concurrent,paymentId);
          return json(res,200,{approved:true,amountPi:Number(concurrent.amount_pi),alreadyApproved:true});
        }
        throw appError('PAYMENT_MISMATCH');
      }
      throw appError('DATABASE_ERROR',{},inserted.error);
    }
    return json(res,200,{approved:true,amountPi});
  }catch(error){return handleError(error,res,localize(locale,'تعذر اعتماد الدفعة عبر Pi. حاول مرة أخرى.','Could not approve the Pi payment. Try again.'),locale);}
}
