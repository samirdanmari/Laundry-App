import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'
import { provideHttpClient, withFetch } from '@angular/common/http';;
import { App } from './app/app';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import 'zone.js'; // Required for Angular's change detection




bootstrapApplication(App, {
  providers: [
    provideHttpClient(withFetch()), // ✅ enables HttpClient with Fetch API
    provideRouter(routes)
  ]
});
