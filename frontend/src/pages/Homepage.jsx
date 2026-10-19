import HomeNavbar from "../components/homepage/HomeNavbar";
import HomeHero from "../components/homepage/HomeHero";
import HomeDepartments from "../components/homepage/HomeDepartments";
import HomeDoctors from "../components/homepage/HomeDoctors";
import HomeInfoSections from "../components/homepage/HomeInfoSections";
import HomeFooter from "../components/homepage/HomeFooter";
import "../components/homepage/home.css";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <HomeNavbar />

      <main>
        <HomeHero />
        <HomeDepartments />
        <HomeDoctors />
        <HomeInfoSections />
      </main>

      <HomeFooter />
    </div>
  );
};

export default Homepage;