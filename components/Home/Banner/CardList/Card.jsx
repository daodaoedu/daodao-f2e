import Link from 'next/link';

const Card = ({ title, link, image }) => (
  <Link href={link} passHref>
    <li className="rounded-[10px] w-[260px] h-[320px] overflow-hidden cursor-pointer">
      <div
        className="h-[260px] bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="bg-white flex items-center h-[60px] pl-5 font-medium">
        {title}
      </div>
    </li>
  </Link>
);

export default Card;
