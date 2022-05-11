import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LandingComponent} from "./landing/landing.component";
import {AboutComponent} from "./page/about/about.component";
import {ConsoleComponent} from "./console/console.component";

const routes: Routes = [
  {path: '*', redirectTo: '', pathMatch: 'full'},
  {path: '', redirectTo: '/Landing', pathMatch: 'full'},
  {path: 'Landing', component: LandingComponent},
  {path: 'About', component: AboutComponent},
  {path: 'Console', component: ConsoleComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
