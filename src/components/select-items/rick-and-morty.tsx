export type RickAndMortyItemT = {
  name: string;
  episode: string[];
  image: string;
};

type RickAndMortyItemProps = {
  highlight: string;
  item: RickAndMortyItemT;
};

export const rickAndMortySelectRenderer = ({ item, highlight = '' }: RickAndMortyItemProps) => {
  const parts = item.name.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <div className="flex flex-row items-center">
      <img className="w-10 h-10 mr-3 rounded-md" src={item.image} alt={item.name} />
      <div className="flex flex-col items-start">
        <span className="text-lg">
          {parts.map((part, i) => (
            <span className="text-[#475569] font-medium" key={i} style={part.toLowerCase() === highlight.toLowerCase() ? { fontWeight: '800' } : {}}>
              {part}
            </span>
          ))}
        </span>
        <span className="text-sm font-medium text-[#64748b]">{item.episode.length} Episodes</span>
      </div>
    </div>
  );
};

export const rickAndMortySkeletonRenderer = () => {
  return (
    <div className="flex flex-row items-center">
      <div className="w-10 h-10 mr-3 bg-gray-200 rounded-md animate-pulse"></div>
      <div className="flex flex-col items-start">
        <div className="w-20 h-4 mb-1 bg-gray-200 animate-pulse"></div>
        <div className="w-16 h-3 bg-gray-200 animate-pulse"></div>
      </div>
    </div>
  );
};
