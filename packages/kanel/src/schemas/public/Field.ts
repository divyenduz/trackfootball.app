// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { default as FieldUsage } from './FieldUsage'

/** Identifier type for public.Field */
export type FieldId = number & { __brand: 'public.Field' }

/** Represents the table public.Field */
export default interface Field {
  id: FieldId

  name: string

  topLeft: number[]

  topRight: number[]

  bottomRight: number[]

  bottomLeft: number[]

  city: string

  usage: FieldUsage

  address: string | null

  zoom: number
}

/** Represents the initializer for the table public.Field */
export interface FieldInitializer {
  /** Default value: nextval('"Field_id_seq"'::regclass) */
  id?: FieldId

  name: string

  topLeft?: number[] | null

  topRight?: number[] | null

  bottomRight?: number[] | null

  bottomLeft?: number[] | null

  city: string

  usage: FieldUsage

  address?: string | null

  /** Default value: 17.5 */
  zoom?: number
}

/** Represents the mutator for the table public.Field */
export interface FieldMutator {
  id?: FieldId

  name?: string

  topLeft?: number[] | null

  topRight?: number[] | null

  bottomRight?: number[] | null

  bottomLeft?: number[] | null

  city?: string

  usage?: FieldUsage

  address?: string | null

  zoom?: number
}
