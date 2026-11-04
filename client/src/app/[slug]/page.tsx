import { InfoPage } from "@/components/shared/InfoPage";
export function generateStaticParams(){return ["dashboard","transactions","charts","pricing","about","careers","blog","contact","help-center","docs","faq","security","terms-of-service","privacy-policy","cookie-policy"].map((slug)=>({slug}))}
export default async function InfoRoute({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const title=slug.split("-").map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(" ");return <InfoPage title={title} slug={slug}/>}
