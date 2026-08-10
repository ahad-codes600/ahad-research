export const metadata={title:"Market Charts",description:"Interactive historical market and macroeconomic charts for gold, the dollar, equities, yields and inflation.",alternates:{canonical:"/charts"}};

import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import MarketChartsClient from "../../components/MarketChartsClient";
export default function ChartsPage(){return <><SiteHeader/><MarketChartsClient/><SiteFooter/></>}
