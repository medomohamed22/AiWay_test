import {allowMethods,json,requestLocale,localize,requireAdminToken,db,getAvailableModels,getToolModelSettings,GEMINI_IMAGE_MODELS} from './_lib.js';
export default async function handler(req,res){
  if(!allowMethods(req,res,['GET','POST']))return;
  const locale=requestLocale(req);
  try{
    await requireAdminToken(req);
    if(req.method==='GET'){
      const models=(await getAvailableModels()).sort((a,b)=>(a.pricing.prompt+a.pricing.completion)-(b.pricing.prompt+b.pricing.completion));
      const imageModels=GEMINI_IMAGE_MODELS.map(x=>({...x})).sort((a,b)=>(a.pricing.request||0)-(b.pricing.request||0));
      return json(res,200,{settings:await getToolModelSettings(),models,imageModels,pricingSource:'Google Gemini Developer API pricing',pricingSourceUrl:'https://ai.google.dev/gemini-api/docs/pricing',refreshedAt:'2026-07-31'});
    }
    const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const allowed=['coding','summary','ads','writing','translate','study','business','image'];
    const validText=new Set((await getAvailableModels()).map(x=>x.id));
    const validImages=new Set(GEMINI_IMAGE_MODELS.map(x=>x.id));
    const settings={};
    for(const k of allowed){const value=b.settings?.[k];if(typeof value==='string'&&value.length<100&&((k==='image'?validImages:validText).has(value)))settings[k]=value;}
    const {error}=await db().from('ai_settings').upsert({key:'tool_models',value:settings,updated_at:new Date().toISOString()},{onConflict:'key'});if(error)throw error;
    return json(res,200,{ok:true,settings:{...(await getToolModelSettings()),...settings}});
  }catch(e){console.error(e);return json(res,500,{error:localize(locale,'تعذر حفظ إعدادات النماذج.','Could not save model settings.')});}
}
