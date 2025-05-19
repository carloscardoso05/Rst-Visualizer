import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { DocumentPageComponent } from './pages/document-page/document-page.component';

export const routes: Routes = [
  {
    component: HomePageComponent,
    path: '',
    pathMatch: 'full',
  },
  {
    component: DocumentPageComponent,
    path: 'documents/:id',
  },
];
