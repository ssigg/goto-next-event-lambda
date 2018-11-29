import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { DirectionsDirective } from './directions.directive';
import { GoogleGeocodingService } from './google-geocoding.service';
import { LineNumberPipe } from './line-number.pipe';
import { AddressLinePipe } from './address-line.pipe';
import { RouterModule } from '@angular/router';
import { TransportService } from './transport.service';


@NgModule({
  declarations: [
    AppComponent,
    DirectionsDirective,
    LineNumberPipe,
    AddressLinePipe
  ],
  imports: [
    RouterModule.forRoot([]),
    BrowserModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCpLjmfi3hs4lphiXcFt1p3EKZa-OdJzzA'
    })
  ],
  providers: [
    GoogleGeocodingService,
    TransportService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
