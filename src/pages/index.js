import ColorGrid from '@/components/ColorGrid'
export default function Home() {
  return (
    <main className="">
      <ColorGrid gridSize={4} numOpacitiesPerColor={4} />
    </main>
  )
}
