import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// import { installPatch } from './monkey-patch';

if (environment.production) {
  enableProdMode();
}

// installPatch();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
