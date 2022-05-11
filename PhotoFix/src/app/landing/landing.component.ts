import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit {

  text_display_prefix = '';
  text_display = '';

  groups: { 'prefix': string, 'texts': string[] }[] = [
    {'prefix': 'Better ', 'texts': ['Quality', 'Resolution', 'Colors', 'Texture', 'Up-scaling']},
    {'prefix': 'For ', 'texts': ['Printing', 'E-Commerce', 'Photography', 'Happy Memory']}
  ]

  memories = [
    {'lr': 'assets/bw_sample_1_lr.png', 'hr': 'assets/bw_sample_1_hr.png'},
    {'lr': 'assets/bw_sample_2_lr.png', 'hr': 'assets/bw_sample_2_hr.png'},
    {'lr': 'assets/bw_sample_3_lr.png', 'hr': 'assets/bw_sample_3_hr.png'},
    {'lr': 'assets/bw_sample_4_lr.png', 'hr': 'assets/bw_sample_4_hr.png'},
    {'lr': 'assets/bw_sample_5_lr.png', 'hr': 'assets/bw_sample_5_hr.png'},
  ]

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  delay(ms: number) {
    this.cdr.detectChanges();
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async ngAfterViewInit() {
    const backspace_delay = 50;
    const typing_delay = 100;
    const pause_delay = 1000;

    while (true) {
      for (let group of this.groups) {
        for (let char of group.prefix) {
          this.text_display_prefix += char;
          await this.delay(typing_delay);
        }

        for (let text of group.texts) {
          for (let char of text) {
            this.text_display += char;
            await this.delay(typing_delay);
          }

          await this.delay(pause_delay);

          for (let char of text) {
            this.text_display = this.text_display.substring(0, this.text_display.length - 1);
            await this.delay(backspace_delay);
          }
        }

        for (let char of group.prefix) {
          this.text_display_prefix = this.text_display_prefix.substring(0, this.text_display_prefix.length - 1);
          await this.delay(backspace_delay);
        }
      }
    }
  }
}

@Component({
  selector: 'image-comparison-component',
  template: `
    <section class="relative overflow-hidden" #comparison>
      <img #image_one class="h-full w-full object-cover object-left" alt="image_one">
      <img #image_two class="h-full w-[50%] object-left object-cover absolute inset-0" alt="image_two">
      <div #slider_bar class="h-full w-0.5 absolute left-[50%] top-0 bg-white"></div>
      <div class="h-full w-full absolute inset-0">
        <ng-content></ng-content>
      </div>
    </section>
  `,
})
export class ImageComparisonComponent implements AfterViewInit {

  @Input() left_src!: string;
  @Input() right_src!: string;
  @Input() class!: string;

  @ViewChild('comparison') comparison!: ElementRef;
  @ViewChild('image_one') right_image!: ElementRef;
  @ViewChild('image_two') left_image!: ElementRef;
  @ViewChild('slider_bar') slider_bar!: ElementRef;

  constructor() {
  }

  ngAfterViewInit() {
    if (this.class) {
      const classes = this.class.split(' ')
      for (let index in classes) {
        this.comparison.nativeElement.classList.add(classes[index]);
      }
    }

    this.left_image.nativeElement.src = this.left_src;
    this.right_image.nativeElement.src = this.right_src;

    const mouse_listener = (event: MouseEvent) => this.onSlideOver(event)
    const touch_listener = (event: MouseEvent) => this.onSlideOver(event)

    this.comparison.nativeElement.addEventListener('mousemove', mouse_listener);
    this.comparison.nativeElement.addEventListener('touchmove', touch_listener);

    this.comparison.nativeElement.addEventListener('mouseleave', () => this.onSlideLeave());
  }

  onSlideOver(event: Event) {
    let x = 0
    if (event instanceof MouseEvent) {
      x = event.pageX - this.right_image.nativeElement.getBoundingClientRect().left
    }
    if (event instanceof TouchEvent) {
      x = event.changedTouches[0].pageX - this.right_image.nativeElement.getBoundingClientRect().left
    }
    const progress = `${+(x / this.comparison.nativeElement.offsetWidth * 100)}%`;
    this.left_image.nativeElement.style.width = progress
    this.slider_bar.nativeElement.style.left = progress;
  }

  onSlideLeave() {
    this.left_image.nativeElement.style.width = '50%';
    this.slider_bar.nativeElement.style.left = '50%';
  }
}
