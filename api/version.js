import {allowMethods,json} from './_lib.js';
export default function handler(req,res){
  if(!allowMethods(req,res,['GET']))return;
  const version=process.env.VERCEL_GIT_COMMIT_SHA||process.env.VERCEL_DEPLOYMENT_ID||process.env.APP_VERSION||'local-development';
  return json(res,200,{version});
}
