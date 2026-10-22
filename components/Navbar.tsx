import Link from "next/link";
import Image from "next/image";

const Navbar = () => (
  <header>
    <nav>
      <Link href="/" className="logo" aria-label="StackUp home">
        <Image src="/icons/logo.png" alt="" width={24} height={24} />
        <p>StackUp</p>
      </Link>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/#events">Events</Link></li>
      </ul>
    </nav>
  </header>
);

export default Navbar;
