import { Component, Prop, h } from '@stencil/core';
import { waitUntilReady, locale } from '../../stores/i18n';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
  @Prop() newLocale: string;

  async componentWillLoad() {
    await waitUntilReady;
  }

  render() {
    return <div>
      <button onClick={() => locale.set(this.newLocale ?? 'fr')}>Change locale</button>
      <span>{locale.get()}</span>
    </div>
  }
}
