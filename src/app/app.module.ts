import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } 
    from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PicturePageComponent } from './picture-page/picture-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { TimelineModule } from "primeng/timeline";
import { CardModule } from "primeng/card";



@NgModule({
  declarations: [
    AppComponent,
    PicturePageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NoopAnimationsModule,
    MatSliderModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    TimelineModule,
    CardModule
  ],
  providers: [],
  bootstrap: [AppComponent, PicturePageComponent]
})
export class AppModule { }
