import Image from "next/image";
import Link from "next/link";

const ExploreBtn = () => (
  <Link href="#events" id="explore-btn" className="mt-7 mx-auto">
    Explore Events
    <Image src="/icons/arrow-down.svg" alt="" width={24} height={24} />
  </Link>
);

export default ExploreBtn;
