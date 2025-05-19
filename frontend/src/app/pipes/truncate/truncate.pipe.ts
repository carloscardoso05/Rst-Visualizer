import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, max: number): string {
    if (!value) {
      return '';
    }
    if (value.length > max) {
      return value.slice(0, max) + '...';
    }
    return value;
  }
}
