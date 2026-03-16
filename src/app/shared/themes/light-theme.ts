import { themeQuartz, iconSetQuartzLight } from 'ag-grid-community';

export const lightTheme = themeQuartz
  .withPart(iconSetQuartzLight)
  .withParams({
    backgroundColor: '#ffffff',
    browserColorScheme: 'light',
    columnBorder: false,
    fontFamily: 'Arial',
    foregroundColor: 'rgb(46, 55, 66)',
    headerBackgroundColor: '#F9FAFB',
    headerFontWeight: 600,
    headerTextColor: '#919191',
    oddRowBackgroundColor: '#F9FAFB',
    rowBorder: false,
    sidePanelBorder: false,
    spacing: 8,
    wrapperBorder: false,
    wrapperBorderRadius: 0,
  });
