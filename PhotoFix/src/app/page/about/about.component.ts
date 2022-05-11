import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  mentors = [
    {'name':'Fahmi Iman Alfarizki', 'image':'https://avatars.githubusercontent.com/u/20066846?v=4', 'github':'https://github.com/fahmimnalfrzki'},
    {'name':'Afif A. Iskandar', 'image':'https://avatars.githubusercontent.com/u/11188566', 'github':'https://github.com/afifai'},
    {'name':'Raka Ardhi', 'image':'https://avatars.githubusercontent.com/u/24475633?v=4', 'github':'https://github.com/ardhiraka'},
    {'name':'Rafif Aditio', 'image':'https://avatars.githubusercontent.com/u/89371310?v=4', 'github':'https://github.com/rafifaditio'},
    {'name':'Sardi Irfansyah', 'image':'https://avatars.githubusercontent.com/u/64241627?v=4', 'github':'https://github.com/Sardiirfan27'},
    {'name':'Danu Purnomo', 'image':'https://avatars.githubusercontent.com/u/88300495?v=4', 'github':'https://github.com/danupurnomo'}
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
