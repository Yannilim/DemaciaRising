import "../sass/Banner.scss";
import BannerItem from "./BannerItem";
const Banner = () => {
  return (
    <div className="banner">
      <BannerItem ItemName="Map" to="/map" />
      <BannerItem ItemName="Tree" to="/tree" />
    </div>
  );
};

export default Banner;
