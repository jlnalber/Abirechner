import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FachComponent } from './komponenten/fach/fach.component';
import { HomeComponent } from './komponenten/home/home.component';
import { FormsModule } from '@angular/forms';
import { AbiComponent } from './komponenten/abi/abi.component';

@NgModule({
  declarations: [
    AppComponent,
    FachComponent,
    HomeComponent,
    AbiComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
