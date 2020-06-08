import moment from 'moment';
import numeral from 'numeral';

// TODO: improve readability
export class Humanize {
  static parseTime(input: number) {
    let duration = '';
    const durationSec = moment.duration(input, 's');

    if (input === 0) {
      duration = '0';
    } else if (durationSec.as('s') > 1 && durationSec.as('s') < 60) {
      duration = `${durationSec.as('s').toFixed(2)} sec`;
    } else if (durationSec.as('s') >= 60) {
      let secs = durationSec.as('s');
      const secondsInDay = 24 * 60 * 60;
      if (secs >= secondsInDay) {
        const days = Math.floor(secs / secondsInDay);
        duration = `${days} days, `;
        secs %= secondsInDay;
      }
      duration += numeral(secs).format('00:00:00');
    } else if (durationSec.as('ms') < 1) {
      duration = `${(durationSec.as('ms') * 1000).toFixed(2)} µs`;
    } else {
      duration = `${durationSec.as('ms').toFixed(2)} ms`;
    }
    return duration;
  }

  static transform(metricValue: number | null, name?: string): string {
    if (metricValue === null) {
      return '0';
    }

    let res = '0';
    switch (name) {
      // "top 10"/profile queries no name parameters
      case undefined:
        res = metricValue !== 0 && metricValue < 0.00001 ? '<' : '';
        res += Humanize.parseTime(metricValue);
        break;
      // time
      case 'time':
        res = metricValue !== 0 && metricValue < 0.00001 ? '<' : '';
        res += Humanize.parseTime(metricValue);
        break;
      // size
      case 'size':
        if (metricValue !== 0 && metricValue < 0.01) {
          res = '<0.01 B';
        } else {
          res = numeral(metricValue).format('0.00 b');
        }
        res = res.replace(/([\d]) B/, '$1 Bytes');
        break;
      // ops
      case 'number':
        if (metricValue !== 0 && metricValue < 0.01) {
          res = '<0.01';
        } else {
          res = numeral(metricValue).format('0.00a');
        }
        break;
      case 'percent':
        if (metricValue !== 0 && metricValue < 0.0001) {
          res = '<0.01';
        } else if (metricValue === 1) {
          res = '100%';
        } else {
          res = numeral(metricValue).format('0.00%');
        }
        break;
      case 'percentRounded':
        if (metricValue !== 0 && metricValue < 0.0001) {
          res = '<0.01';
        } else {
          res = numeral(metricValue).format('0%');
        }
        break;
      // ops
      default:
        if (metricValue !== 0 && metricValue < 0.01) {
          res = '<0.01';
        } else {
          res = numeral(metricValue).format('0.00 a');
        }
        break;
    }
    return String(res).replace('<0.00', '<0.01');
  }
}
