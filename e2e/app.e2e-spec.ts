import { SourceCodePage } from './app.po';

describe('source-code App', function() {
  let page: SourceCodePage;

  beforeEach(() => {
    page = new SourceCodePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
