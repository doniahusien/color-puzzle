import ColorGrid from '@/components/ColorGrid';
import img from '../../public/Thumbnail.png';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='start'>
      {/*<ColorGrid gridSize={4} numOpacitiesPerColor={4} />*/}
      <div className="center-left">
        <h1>Color Hue Puzzle</h1>
        <Link href="/colorGame">
        <button className="start-button">Start Play</button>
        </Link>
      </div>
    </main>
  );
}