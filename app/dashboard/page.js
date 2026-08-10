import DashboardClient from "../../components/DashboardClient";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata={
 title:"Market Intelligence Dashboard | Ahad Research",
 description:"Current macroeconomic and market indicators for financial research."
};

export default function Dashboard(){return <><SiteHeader/><DashboardClient/><SiteFooter/></>;}