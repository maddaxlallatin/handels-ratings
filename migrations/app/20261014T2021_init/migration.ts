#!/usr/bin/env -S bun
import type { Contract as End } from '../../snapshots/e9965def99dc407c17c4ec83d40c4652a24ef41942abd3c833183097aa813b2c/contract';
import endContract from '../../snapshots/e9965def99dc407c17c4ec83d40c4652a24ef41942abd3c833183097aa813b2c/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Flavor',
        columns: [
          col('available', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('bases', 'text[]', { notNull: true, codecRef: { codecId: 'pg/text@1', many: true } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Flavor_bases_elem_not_null_5d2da1db',
            'array_position("bases", NULL) IS NULL',
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Preference',
        columns: [
          col('base', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('kind', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('Preference_kind_check_5582e182', `"kind" IN ('like', 'dislike')`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Review',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('flavorId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('imagePath', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('note', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('score', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('visitedOn', 'date', { notNull: true, codecRef: { codecId: 'pg/date-string@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('review_score_range_f9c54a13', 'score >= 1 AND score <= 10'),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Flavor',
        constraint: 'Flavor_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Flavor',
        constraint: 'Flavor_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Preference',
        constraint: 'Preference_userId_base_key',
        columns: ['userId', 'base'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_name_key',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Flavor',
        index: 'Flavor_available_idx_1b9f4739',
        columns: ['available'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Preference',
        index: 'Preference_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Review',
        index: 'Review_flavorId_idx_aa9bfbfb',
        columns: ['flavorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Review',
        index: 'Review_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Review',
        index: 'Review_visitedOn_idx_828c8027',
        columns: ['visitedOn'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Preference',
        foreignKey: {
          name: 'Preference_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Review',
        foreignKey: {
          name: 'Review_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Review',
        foreignKey: {
          name: 'Review_flavorId_fkey',
          columns: ['flavorId'],
          references: { schema: 'public', table: 'Flavor', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
