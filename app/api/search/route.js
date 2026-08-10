import {NextResponse} from "next/server";
import {getPublishedArticles} from "../../../lib/articles";
export async function GET(req){
 const u=new URL(req.url),q=(u.searchParams.get("q")||"").trim().toLowerCase(),cat=u.searchParams.get("category")||"all";
 let a=(await getPublishedArticles()).filter(x=>cat==="all"||x.category===cat);
 if(q)a=a.filter(x=>[x.title,x.excerpt,x.content,x.categoryLabel].some(v=>String(v||"").toLowerCase().includes(q)));
 return NextResponse.json({articles:a});
}
