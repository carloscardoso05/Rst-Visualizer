import { Routes } from '@angular/router';
import { DocumentsInfoComponent } from './components/documents-info/documents-info.component';
import { DocumentDetailsComponent } from './components/document-details/document-details.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DocumentsInfoComponent,
  },
  {
    path: 'documents/:documentId',
    component: DocumentDetailsComponent,
  },
  {
    path: 'documents/:documentId/relations/:relationId',
    component: DocumentDetailsComponent,
  },
];
