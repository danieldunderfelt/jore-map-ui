import IExternalCodeListItem from '~/models/externals/IExternalCodeListItem';
import ICodeListItem from '~/models/ICodeListItem';

class CodeListFactory {
    public static createCodeListItem = (
        externalCodeListItem: IExternalCodeListItem
    ): ICodeListItem => ({
        label: externalCodeListItem.kooselite,
        listId: externalCodeListItem.koolista,
        orderNumber: externalCodeListItem.koojarjestys,
        value: externalCodeListItem.kookoodi
    });
}

export default CodeListFactory;
