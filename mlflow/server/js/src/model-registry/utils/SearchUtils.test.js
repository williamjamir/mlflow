import {
  getModelNameFilter,
  getCombinedSearchFilter,
  constructSearchInputFromURLState,
  // BEGIN-EDGE
  OwnerFilter,
  getUserId,
  StatusFilter,
  // END-EDGE
} from './SearchUtils';

describe('getModelNameFilter', () => {
  it('should construct name filter correctly', () => {
    expect(getModelNameFilter('abc')).toBe("name ilike '%abc%'");
  });
});

describe('getCombinedSearchFilter', () => {
  it('should return filter string correctly with plain name strings', () => {
    expect(getCombinedSearchFilter({ query: 'xyz' })).toBe("name ilike '%xyz%'");
  });

  it('should return filter string correctly with MLflow Search Syntax string with tags.', () => {
    expect(getCombinedSearchFilter({ query: "tags.k = 'v'" })).toBe("tags.k = 'v'");
  });

  it('should return filter string correctly with MLflow Search Syntax string with tags. and name', () => {
    expect(getCombinedSearchFilter({ query: "name ilike '%abc%' AND tags.k = 'v'" })).toBe(
      "name ilike '%abc%' AND tags.k = 'v'",
    );
  });
  // BEGIN-EDGE
  it('should return filter string correctly with MLflow Search Syntax string with tags. and name and owned by me', () => {
    const userId = getUserId();
    expect(
      getCombinedSearchFilter({
        query: "name ilike '%abc%' AND tags.k = 'v'",
        selectedOwnerFilter: OwnerFilter.OWNED_BY_ME,
        selectedStatusFilter: StatusFilter.ALL,
      }),
    ).toBe(`name ilike '%abc%' AND tags.k = 'v' AND userId = ${userId}`);
  });

  it('should return filter string correctly with MLflow Search Syntax string with tags. and name and accessible by me', () => {
    expect(
      getCombinedSearchFilter({
        query: "name ilike '%abc%' AND tags.k = 'v'",
        selectedOwnerFilter: OwnerFilter.ACCESSIBLE_BY_ME,
        selectedStatusFilter: StatusFilter.ALL,
      }),
    ).toBe(`name ilike '%abc%' AND tags.k = 'v'`);
  });

  it('should return filter string correctly with only owned by me seleceted', () => {
    const userId = getUserId();
    expect(
      getCombinedSearchFilter({
        selectedOwnerFilter: OwnerFilter.OWNED_BY_ME,
        selectedStatusFilter: StatusFilter.ALL,
      }),
    ).toBe(`userId = ${userId}`);
  });

  it('should return filter string correctly with MLflow Search Syntax string with tags. and name and served models', () => {
    expect(
      getCombinedSearchFilter({
        query: "name ilike '%abc%' AND tags.k = 'v'",
        selectedOwnerFilter: OwnerFilter.ACCESSIBLE_BY_ME,
        selectedStatusFilter: StatusFilter.SERVING_ENABLED,
      }),
    ).toBe(`name ilike '%abc%' AND tags.k = 'v' AND ext.served = 'true'`);
  });

  it('should return filter string correctly with served models seleceted', () => {
    expect(
      getCombinedSearchFilter({
        selectedOwnerFilter: OwnerFilter.ACCESSIBLE_BY_ME,
        selectedStatusFilter: StatusFilter.SERVING_ENABLED,
      }),
    ).toBe(`ext.served = 'true'`);
  });
  // END-EDGE
});

describe('constructSearchInputFromURLState', () => {
  it('should construct searchInput correctly from URLState with nameSearchInput', () => {
    expect(constructSearchInputFromURLState({ nameSearchInput: 'xyz' })).toBe('xyz');
  });

  it('should construct searchInput correctly from URLState with tagSearchInput', () => {
    expect(constructSearchInputFromURLState({ tagSearchInput: "tags.k = 'v'" })).toBe(
      "tags.k = 'v'",
    );
  });

  it('should construct searchInput correctly from URLState with nameSearchInput and tagSearchInput', () => {
    expect(
      constructSearchInputFromURLState({
        nameSearchInput: 'xyz',
        tagSearchInput: "tags.k = 'v'",
      }),
    ).toBe("name ilike '%xyz%' AND tags.k = 'v'");
  });

  it('should construct searchInput correctly from URLState with searchInput', () => {
    expect(
      constructSearchInputFromURLState({
        searchInput: 'name ilike "%xyz%" AND tags.k = "v"',
      }),
    ).toBe('name ilike "%xyz%" AND tags.k = "v"');
  });
});
