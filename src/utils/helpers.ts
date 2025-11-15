export const downloadFile = async (data: { name: string; extension: string; content: unknown }) => {
  const a = document.createElement('a');
  a.download = data.name + '.' + data.extension;
  a.href = `data:text/${data.extension};base64,${data.content}`;
  a.click();
};

export const createNewFilterArray = (array1, array2) => {
  return array2.map((filter) => {
    // Find the corresponding item in array1
    const relatedItem = array1.find((item) =>
      item.actionFilters.some((actionFilter) => actionFilter.portalListingFilterId === filter.portalListingFilterId)
    );

    return {
      PortalListingId: relatedItem ? relatedItem.portalListingId : '',
      ActionFilterId: filter.portalListingFilterId,
    };
  });
};
