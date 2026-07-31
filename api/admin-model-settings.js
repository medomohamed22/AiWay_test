import {allowMethods,json,requestLocale,localize,requireAdminToken,db,getAvailableModels,getToolModelSettings,getAiTools,GEMINI_IMAGE_MODELS} from './_lib.js';
export default async function handler(req,res){
  if(!allowMethods(req,res,['GET','POST']))return;
  const locale=requestLocale(req);
  try{
    await requireAdminToken(req);
    if(req.method==='GET'){
      const models=(await getAvailableModels()).sort((a,b)=>(a.pricing.prompt+a.pricing.completion)-(b.pricing.prompt+b.pricing.completion));
      const imageModels=GEMINI_IMAGE_MODELS.map(x=>({...x})).sort((a,b)=>(a.pricing.request||0)-(b.pricing.request||0));
      return json(res,200,{tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings(),models,imageModels,pricingSource:'Google Gemini Developer API pricing',pricingSourceUrl:'https://ai.google.dev/gemini-api/docs/pricing',refreshedAt:'2026-07-31'});
    }
    const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const tools=await getAiTools({includeInactive:true});
    const validText=new Set((await getAvailableModels()).map(x=>x.id));
    const validImages=new Set(GEMINI_IMAGE_MODELS.map(x=>x.id));
    const updates=[];
    for(const tool of tools){
      const value=b.settings?.[tool.id];
      const valid=(tool.tool_type==='image'?validImages:validText).has(value);
      if(typeof value==='string'&&value.length<100&&valid)updates.push({...tool,model_id:value,updated_at:new Date().toISOString()});
    }
    if(!updates.length)return json(res,400,{error:localize(locale,'لم يتم إرسال إعدادات صالحة.','No valid settings were submitted.')});
    const {error}=await db().from('ai_tools').upsert(updates,{onConflict:'id'});if(error)throw error;
    return json(res,200,{ok:true,tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings()});
  }catch(e){console.error(e);return json(res,500,{error:localize(locale,'تعذر حفظ إعدادات النماذج.','Could not save model settings.')});}
}
