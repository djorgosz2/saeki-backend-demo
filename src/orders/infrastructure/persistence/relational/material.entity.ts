import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('material')
export class Material {
  @PrimaryGeneratedColumn({ name: 'material_id', type: 'int' })
  materialId: number;

  @Column({ name: 'material_name', type: 'varchar', length: 50 })
  materialName: string;
}
