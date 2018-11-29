import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'addressLine' })
export class AddressLinePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace('\\', '');
  }
}
