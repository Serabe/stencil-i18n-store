import { newE2EPage } from '@stencil/core/testing';

describe('syncs locale with html[lang]', () => {
  it('replaces lang in html', async () => {
    const page = await newE2EPage();

    await page.setContent('<my-component new-locale="pt"></my-component>');

    expect(await getLang(page)).not.toBe('pt');

    await (await page.find('my-component >>> button')).click();

    expect(await getLang(page)).toBe('pt');
  });

  it('updates the component with the new locale', async () => {
    const page = await newE2EPage();

    await page.setContent('<my-component new-locale="pt"></my-component>');

    expect(await (await page.find('my-component >>> span')).textContent).toBe('en');

    await (await page.find('my-component >>> button')).click();

    expect(await (await page.find('my-component >>> span')).textContent).toBe('pt');
  });
});

// I don't know how the hell to get the lang attribute in the html
// tag :(
async function getLang(page): Promise<string | undefined> {
  const content: string = await page.content();

  const match = content.match(/<html [^>]+?lang="([^"]+?)"/);

  return match?.[1] ?? undefined;
}
