import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { rickAndMortySelectRenderer, rickAndMortySkeletonRenderer } from './components/select-items/rick-and-morty';
import { getCharacterOptions } from './actions/rick-and-morty';
import MultiSelect from './components/ui/multi-select';

function App() {
  const [searchValue, setSearchValue] = React.useState('');

  const {
    data: characters,
    isFetching,
    isLoading,
    error,
    refetch
  } = useQuery({
    retry: 0,
    queryKey: ['characters', searchValue],
    queryFn: ({ signal }) => getCharacterOptions({ signal, queryKey: ['characters', searchValue] })
  });

  React.useEffect(() => {
    // refetch data when debounced search value changes
    refetch();
  }, [searchValue, refetch]);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <MultiSelect
          isAsync={true}
          onValueChange={(value) => setSearchValue(value)}
          error={error ? error.message : undefined}
          isLoading={isLoading || isFetching}
          options={characters ?? []}
          renderOption={rickAndMortySelectRenderer}
          renderSkeleton={rickAndMortySkeletonRenderer}
        />
      </div>
    </div>
  );
}

export default App;
