import type React from "react";
import { useNavigate } from "react-router-dom";

interface BannerItemProps {
  ItemName: string;
  to: string;
}

const BannerItem: React.FC<BannerItemProps> = ({ ItemName, to }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(to);
  };

  return (
    <div className="BannerItem" onClick={handleClick}>
      {ItemName}
    </div>
  );
};

export default BannerItem;
