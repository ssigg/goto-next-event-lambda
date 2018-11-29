import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'lineNumber' })
export class LineNumberPipe implements PipeTransform {

  transform(value: string): string {
    const number = Number(value);
    return Number.isNaN(number) ? '' : value;
  }
}
