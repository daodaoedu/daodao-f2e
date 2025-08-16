import Link from 'next/link';

const Card = ({ title, link, image }) => (
  <Link href={link} passHref>
    <li className="h-[320px] w-[260px] cursor-pointer overflow-hidden rounded-[10px]">
      <div
        className="h-[260px] bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="flex h-[60px] items-center bg-white pl-5 font-medium">
        {title}
      </div>
    </li>
  </Link>
);

export default Card;
