import { test, expect } from '../src/fixtures/base.fixture';

test.describe('Test Table Page', () => {
  test.beforeEach(async ({ testTablePage }) => {
    await testTablePage.navigate();
  });

  test('Test case 1: Select Language filter → Java - only Java courses are visible', async ({
    testTablePage,
  }) => {
    const beforeRowCount = await testTablePage.getCourseRowsCount();
  
    const table = testTablePage.tableComponent;
    await testTablePage.selectLanguage('Java');

    const afterCount = await testTablePage.getCourseRowsCount();
   
    expect(afterCount).toBeLessThan(beforeRowCount);
    await table.validateColumnEquals("Language","Java")
  });

  test('Test case 2: Level filter → Beginner only - only Beginner courses are visible', async ({
    testTablePage,}) => {
    const beforeRowCount = await testTablePage.getCourseRowsCount();
    const table = testTablePage.tableComponent;

    await testTablePage.unselectAllLevel();
    await testTablePage.selectLevel("Beginner");

    const afterCount = await testTablePage.getCourseRowsCount();
    expect(afterCount).toBeLessThanOrEqual(beforeRowCount);

    await table.validateColumnEquals("Level","Beginner")
  });

  // test('Test case 3: Min enrollments → 10,000+ - every visible row shows enrollments ≥ 10,000', async ({
  //   testTablePage,}) => {
  //   const table = testTablePage.tableComponent;
  //   await testTablePage.selectMinEnrollments('10,000+');

  //   await table.validateColumnNumericGreaterOrEqual("Enrollments",10000)
  // });

  // test('Test case 4: Combined filters → Python + Beginner + 10,000+ - only matching courses visible', async ({
  //   testTablePage,
  // }) => {
  //   const table = testTablePage.tableComponent;
  //   await testTablePage.selectLanguage('Python');
  //   await testTablePage.unselectAllLevel();
  //   await testTablePage.selectLevel('Beginner');
  //   await testTablePage.selectMinEnrollments('10,000+');

  //   await table.validateColumnEquals('Language', 'Python');
  //   await table.validateColumnEquals('Level', 'Beginner');
  //   await table.validateColumnNumericGreaterOrEqual('Enrollments', 10000);
    
  // });

  // test('Test case 5: No results state - "No matching courses." is shown', async ({
  //   testTablePage,
  // }) => {
  //   await testTablePage.setFiltersToNoResults();

  //   await expect(testTablePage.noMatchingMessage).toBeVisible();
  //   const visible = await testTablePage.isNoMatchingVisible();
  //   expect(visible).toBe(true);
  // });

  // test('Test case 6: Reset button visibility and behavior - defaults restored after Reset', async ({
  //   testTablePage,
  // }) => {
  //  const rowsBeforeReset = await testTablePage.getCourseRowsCount();
  //  await testTablePage.unselectAllLevel();
  //   await expect(testTablePage.resetButton).toBeVisible();

  //   await testTablePage.clickReset();

  //   await expect(testTablePage.resetButton).toBeHidden();
  //   const rowsAfterReset = await testTablePage.getCourseRowsCount();
  //   testTablePage.verifyByDefaultSelectedFilters();
 
  //   expect(rowsAfterReset).toEqual(rowsBeforeReset);
  // });

  // test('Test case 7: Sort by Enrollments - rows ordered smallest to largest (numeric)', async ({
  //   testTablePage,
  // }) => {
  //   const before = await testTablePage.getColumnValues("enrollments");
  //   const expected =  [...before].map(Number).sort((a, b) => a - b);
    
  //   await testTablePage.setSortBy('Enrollments');

  //   const after = (await testTablePage.getColumnValues("enrollments")).map(Number); 

  //   expect(after).toEqual(expected);
  // });

  // test('Test case 8: Sort by Course Name - rows ordered A→Z by course name', async ({
  //   testTablePage,
  // }) => {
  //   const before = (await testTablePage.getColumnValues("course")).sort((a, b) => 
  //     a.localeCompare(b));
  //   await testTablePage.setSortBy('Course Name');

  //   const names = await testTablePage.getColumnValues("course");
  //   const sorted = [...names].sort((a, b) => a.localeCompare(b));
  //   expect(names).toEqual(sorted);
  // });

  // test('Test case 9: Switch language filters multiple times and validate values', async ({
  //   testTablePage,
  // }) => {
  //   const table = testTablePage.tableComponent;
  //   const initialRows = await table.getVisibleRowCount();

  //   const filterSequence = ['Java', 'Python', 'Any', 'Java'];

  //   for (const lang of filterSequence) {
  
  //     await testTablePage.selectLanguage(lang);

  //     const rows = await table.getVisibleRowCount();
  //     const courseLanguages = await testTablePage.getColumnValues('language');
  
  //     if (lang === 'Any') {
  //       expect(rows).toBe(initialRows);
  //     } else {
  //       for (const value of courseLanguages) {
  //         expect(value).toBe(lang);
  //       }
  //     }
  //   }
  // });

  // test('Test case 10: Apply level - Java and Sort by enrollments - Validate results ', async ({
  //   testTablePage,
  // }) => {
  //   const table = testTablePage.tableComponent;
  //   await testTablePage.selectLanguage('Java');

  //   const tableData  = await table.getTableData();

  //   const beforeSort = tableData.map(row => Number(String(row['enrollments']).trim()));
  //   const expectedSortData =  [...beforeSort].sort((a, b) => a - b);

  //   await testTablePage.setSortBy('Enrollments');

  //   const afterSort = (await table.getTableData()).map(row => Number(String(row['enrollments']).trim()));

  //   expect(afterSort).toEqual(expectedSortData);
  //   await table.validateColumnEquals("Language","Java")
  // });

});
