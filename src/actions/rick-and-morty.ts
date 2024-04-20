export const getCharacterOptions = async ({ signal, queryKey }: { signal: AbortSignal; queryKey: [string, string] }) => {
  const [, name] = queryKey;
  const filter = name ? `/?name=${name}` : '';

  try {
    const res = fetch(`https://rickandmortyapi.com/api/character${filter}`, { signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        return data.results.map((character: any) => ({
          value: character.id,
          label: character.name,
          item: character
        }));
      });

    return res;
  } catch (e) {
    console.log('error');
    console.log(e);

    return [];
  }
};
