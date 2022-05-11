import {AfterViewInit, Component, Inject, Injectable, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit, AfterViewInit {

  @ViewChild('fileInput') fileInput!: any;
  @ViewChild('canvas') canvas_ref!: any;
  canvas!: HTMLCanvasElement;

  input_image_url: string | undefined = undefined
  result_image_url: string | undefined = undefined
  is_done: boolean = false;
  MAX_SIZE: number = 512;
  is_loading: boolean = false;

  input_image: HTMLImageElement | undefined;
  result_image: HTMLImageElement | undefined;

  options: { 'key': string, 'value': string, desc: string }[] = [
    {'key': 'Upscale', 'value': 'upscale', 'desc': 'Enhance your image into 4x size using Machine Learning to achieve better quality and texture'},
    {'key': 'Denoise', 'value': 'denoise', 'desc': 'Remove Unwanted Noise and Compression Artifacts from your image'},
    {'key': 'Recolor', 'value': 'recolor', 'desc': 'Turn your old faded image into a new one with re colors'},
  ]

  selected_option = this.options[0];

  private ctx!: CanvasRenderingContext2D;

  constructor(private dialog: MatDialog, private backend: BackendService, private sanitizer: DomSanitizer) {
  }

  ngAfterViewInit() {
    this.canvas = this.canvas_ref.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.onCanvasRefresh()
  }

  onCanvasRefresh(slider_pos = .5) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.input_image) return;
    const lr = this.input_image;
    const hr = this.result_image;
    if (hr !== undefined) {
      this.ctx.drawImage(hr, 0, 0, hr.width, hr.height, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(lr, 0, 0, lr.width * slider_pos, lr.height, 0, 0, this.canvas.width * slider_pos, this.canvas.height);

      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvas.width * slider_pos, 0);
      this.ctx.lineTo(this.canvas.width * slider_pos, this.canvas.height);
      this.ctx.stroke()

      this.ctx.font = '32px sans-serif';
      this.ctx.fillStyle = '#d1d1d1';
      this.ctx.fillText(`Before`, 16, this.canvas.height - 24);
      this.ctx.fillText(`After`, this.canvas.width - 100, this.canvas.height - 24);

    } else this.ctx.drawImage(lr, 0, 0, lr.width, lr.height, 0, 0, this.canvas.width, this.canvas.height);
  }

  ngOnInit(): void {
  }

  onResetState(): void {
    this.input_image_url = undefined;
    this.result_image_url = undefined;
    this.is_done = false;
    this.is_loading = false;
    this.input_image = undefined;
    this.result_image = undefined;
    this.fileInput.nativeElement.value = '';
  }

  onFileChange($event: Event) {
    const files = ($event.target as HTMLInputElement).files as FileList;
    let file!: File
    if (files.length == 1) file = files[0]

    const allowed_types = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowed_types.includes(file.type)) {
      alert('Sadly, only jpg, jpeg and png files are supported.')
      this.onResetState()
    }
    this.onInputChange(file)
  }

  onInputChange(file: File) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = (e: any) => {
      this.onResetState()
      this.input_image_url = e.target.result as string;
      this.getImageResolution(this.input_image_url)
    }
  }

  getImageResolution(image_url: string) {
    const image = new Image();
    image.src = image_url;
    image.onload = () => this.onValidateImage(image)
  }

  onValidateImage(image: HTMLImageElement) {
    const max_size = Math.max(image.width, image.height)
    if (max_size > this.MAX_SIZE) {
      this.dialog.open(NotificationDialog, {
        data: {
          title: 'High Image Resolution',
          message: `I know this sound a bit weird, but it's look like you're uploading High Resolution images to the console. at this
    time we are unable to process high resolution images. do you want to resize the image to ${this.MAX_SIZE} before continuing?`,
        },
        width: '480px',
      }).afterClosed().subscribe(async (response) => {
        if (!response) {
          this.input_image_url = undefined;
          this.fileInput.nativeElement.value = '';
        } else {
          this.input_image_url = await imageResizeWithRatio(image, this.MAX_SIZE)
        }
      })
    }
    const temp = new Image();
    temp.src = this.input_image_url as string;
    temp.onload = () => {
      if (temp.height > temp.width) {
        this.canvas.width = this.canvas.height * temp.width / temp.height;
      } else {
        this.canvas.height = this.canvas.width * temp.height / temp.width;
      }
      this.onCanvasRefresh()
    }
    this.input_image = temp;
  }

  async onSubmit() {
    this.is_done = false;

    const blob = dataURItoBlob(this.input_image_url as string)
    const file = new File([blob], 'image.png')

    let request: Promise<Blob> | undefined

    if (this.selected_option.value === 'upscale') {
      request = this.backend.upscaleImage(file)
    }
    if (this.selected_option.value === 'denoise') {
      request = this.backend.denoiseImage(file)
    }
    if (this.selected_option.value === 'recolor') {
      request = this.backend.recolorImage(file)
    }

    if (request) {
      this.is_loading = true;
      request.then((blob) => {
        this.is_loading = false;
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (e: any) => {
          const output_image = e.target.result as string;
          const image = new Image();
          image.src = output_image;
          image.onload = (() => {
            this.result_image = image;
            this.result_image_url = output_image;
            this.onCanvasRefresh(.5)
          })

          if (this.selected_option.value === 'upscale') {
            const image_2 = new Image();
            image_2.src = this.input_image_url as string;
            image_2.onload = async () => {
              this.is_done = true;
              const max_size = Math.max(image_2.width, image_2.height)
              this.input_image_url = await imageResizeWithRatio(image_2, max_size * 4)
              this.is_loading = false;
            }
          }
        }
      }).catch((err) => {
        this.is_loading = false;
        this.dialog.open(NotificationDialog, {
          data: {
            title: 'Error',
            message: err.message,
          },
          width: '480px',
        })
      })
    }
  }


  onDownload() {
    const a = document.createElement('a');
    a.href = this.result_image_url as string;
    a.download = 'image.png';
    a.click();
  }

  onMouseOver(event: MouseEvent) {
    const bound = this.canvas.getBoundingClientRect()
    this.onCanvasRefresh((event.pageX - bound.left) / bound.width)
  }

  onSetCurrentAsInput() {
    const file = new File([dataURItoBlob(this.result_image_url as string)], 'image.png')
    this.onInputChange(file)
  }
}


function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});
}


async function imageResize(image: HTMLImageElement, width: number, height: number): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return new Promise<string>((resolve, reject) => {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
    } else {
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    }
  })
}

async function imageResizeWithRatio(image: HTMLImageElement, max: number): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  const width = image.width;
  const height = image.height;
  const ratio = width / height;
  if (width > height) {
    canvas.width = max;
    canvas.height = max / ratio;
  } else {
    canvas.height = max;
    canvas.width = max * ratio;
  }
  return imageResize(image, canvas.width, canvas.height);
}

@Component({
  template: `
    <p class="text-lg font-base">{{data.title}}</p>
    <p class="font-light">{{data.message}}</p>
    <div class="flex flex-row flex-row-reverse space-x-4 space-x-reverse mt-4">
      <button class="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-700" (click)="onContinue()">Okay
      </button>
      <button class="px-4 py-2" (click)="onCancel()">Cancel</button>
    </div>
  `
})
export class NotificationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }, private ref: MatDialogRef<NotificationDialog>) {
  }

  onCancel() {
    this.ref.close(false)
  }

  onContinue() {
    this.ref.close(true)
  }
}

@Injectable({providedIn: 'root'})
export class BackendService {
  constructor(private http: HttpClient) {
  }

  async upscaleImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('http://upscale.api.photofix.site', formData, {responseType: 'blob'}).toPromise().then(r => r as Blob)
  }

  async recolorImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('http://recolor.api.photofix.site', formData, {responseType: 'blob'}).toPromise().then(r => r as Blob)
  }

  async denoiseImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('http://denoise.api.photofix.site', formData, {responseType: 'blob'}).toPromise().then(r => r as Blob)
  }
}
