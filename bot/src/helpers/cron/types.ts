import type { CronJobParams } from 'cron';

export type Cron = Omit<CronJobParams, 'start' | 'timeZone' | 'utcOffset'> & {
    name: string;
    timeZone?: string;
};
