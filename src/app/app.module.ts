import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
// import { HighlightModule } from 'ngx-highlightjs';

import { HighlightModule, HIGHLIGHT_OPTIONS, HighlightOptions } from "ngx-highlightjs";

import { AppComponent } from "./app.component";

import { HomeComponent } from "./home/home.component";
import { AppRoutingModule } from "./routing.module";

// Dynamic import does NOT work in Stackblitz, so will fallback to manual library import
// YOU DON'T NEED TO ADD THE FOLLOWING 3 LINES OF CODE
import hljs from 'highlight.js';
document.defaultView['hljs'] = hljs;
import 'highlightjs-line-numbers.js';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    HighlightModule
  ],
  declarations: [AppComponent, HomeComponent],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: <HighlightOptions>{
        lineNumbers: true,
        // The following is just a workaround to activate the line numbers script since dynamic import does not work in Stackblitz
        lineNumbersLoader: () => null
      }
    }
  ]
})
export class AppModule {}
