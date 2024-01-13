import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FachComponent } from './komponenten/fach/fach.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './komponenten/home/home.component';
import { AbiComponent } from './komponenten/abi/abi.component';

const routes: Routes = [
  {
    path: 'abi',
    component: AbiComponent
  },
  {
    path: 'fach/:id',
    component: FachComponent
  },
  {
    path: '**',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
