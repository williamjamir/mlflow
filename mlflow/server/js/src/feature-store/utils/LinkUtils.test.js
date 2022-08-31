import LinkUtils from './LinkUtils';
import { mountWithIntl } from '../../common/utils/TestUtils';

describe('LinkUtils.test', () => {
  test('renderTableSource', () => {
    const dbName = 'feature-store';
    const tableName = 'taxi-fare-table';
    const dbPath = 'dbfs:/path/to/db.table';
    const dbPath2 = 'DBFS:/path/to/db.table';

    const tableSource1 = mountWithIntl(
      LinkUtils.renderTableSourceLink([dbName, tableName].join('.')),
    );
    expect(tableSource1.text()).toEqual(`${dbName}.${tableName}`);
    expect(tableSource1.find('a').prop('href')).toEqual(
      `http://localhost/#table/${dbName}/${tableName}`,
    );
    const tableSource2 = mountWithIntl(LinkUtils.renderTableSourceLink(dbName));
    expect(tableSource2.text()).toEqual(dbName);
    expect(tableSource2.find('a').prop('href')).toEqual(`http://localhost/#table/${dbName}`);
    expect(LinkUtils.renderTableSourceLink(dbPath)).toEqual(dbPath);
    expect(LinkUtils.renderTableSourceLink(dbPath2)).toEqual(dbPath2);
  });
});
