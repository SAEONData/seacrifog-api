/***************************************************
 ********************* NOTES ***********************
 ***************************************************
 *
 * Tables with FK constraints must be dropped first
 * Tables with FK constraints must be created last
 */

DROP TABLE IF EXISTS public.dataproduct_datatype_xref;
DROP TABLE IF EXISTS public.protocol_coverage_xref;
DROP TABLE IF EXISTS public.protocol_uri_xref;
DROP TABLE IF EXISTS public.variable_uri_xref;
DROP TABLE IF EXISTS public.dataproduct_variable_xref;
DROP TABLE IF EXISTS public.protocol_variable_xref;
DROP TABLE IF EXISTS public.variable_protocol_xref;

DROP TABLE IF EXISTS public.relationship_types;
DROP TABLE IF EXISTS public.datatypes;
DROP TABLE IF EXISTS public.dataproducts;
DROP TABLE IF EXISTS public.variables;
DROP TABLE IF EXISTS public.protocols;
DROP TABLE IF EXISTS public.uris;
DROP TABLE IF EXISTS public.protocol_coverages;
DROP TABLE IF EXISTS public.sites;

/*********************************************************/

create or replace function public.get_substring(text, text, int) returns text
  as 'select split_part($1, $2, $3);'
  language sql
  immutable
  returns null on null input;

/*********************************************************/

create table public.sites (
  id           serial,
  code         varchar(200),
  "name"       varchar(200),
  organization varchar(250),
  latitude     point,
  longitude    point,
  constraint  sites_pkey primary key (id),
  constraint sites_unique_cols unique (code, "name", organization)
);

create table public.datatypes (
    id serial,
    "name" text,
    constraint datatypes_pkey primary key (id),
    constraint datatypes_unique_col unique ("name")
);

CREATE TABLE public.protocol_coverages (
	id serial,
	"name" varchar(250),
	CONSTRAINT protocol_coverages_pk PRIMARY KEY (id),
	CONSTRAINT protocol_coverages_uniqe_col UNIQUE("name")
);

CREATE TABLE public.uris (
	id serial,
	uri varchar(32767),
	CONSTRAINT uris_pk PRIMARY KEY (id),
	CONSTRAINT uris_uniqe_col UNIQUE(uri)
);

CREATE TABLE public.variables (
  id                serial,
  "name"            varchar(255)  NOT NULL,
  "class"           varchar(255)  NULL,
  "domain"          varchar(50)   NULL,
  "set"             varchar(50)   NULL,
  description       varchar       NULL,
  "method"          varchar       NULL,
  uri               varchar(2083) NULL,
  rftype            varchar(100)  NULL,
  score             int2          NULL,
  rating            int2          NULL,
  relevance         float4        NULL,
  feasibility       float4        NULL,
  "cost"            float4        NULL,
  updated_by        varchar(255)  NULL,
  updated_at        date          NULL,
  frequency_value   float4        NULL,
  frequency_unit    varchar(25)   NULL,
  frequency_comment varchar       NULL,
  res_value         float4        NULL,
  res_unit          varchar(25)   NULL,
  res_comment       varchar       NULL,
  run_cval          float4        NULL,
  run_cunit         varchar(25)   NULL,
  run_ccomment      varchar       NULL,
  req_source        varchar(255)  NULL,
  req_uri           varchar(2083) NULL,
  technology_type   varchar       NULL,
  constraint variables_pk primary key (id),
  constraint variables_unique_cols unique ("name", "class", "domain")
);

CREATE TABLE public.dataproducts (
  id                   serial,
  title                text         not null,
  publish_year         int4         null,
  publish_date         date         null,
  keywords             text         null,
  abstract             text         null,
  provider             text         null,
  author               text         null,
  contact              text         null,
  coverage_spatial     point[]      null,
  coverage_temp_start  date         null,
  coverage_temp_end    date         null,
  res_spatial          float4       null,
  res_spatial_unit     text         null,
  res_temperature      float4       null,
  res_temperature_unit text         null,
  uncertainty          float4       null,
  uncertainty_unit     text         null,
  doi                  text         null,
  license              text         null,
  url_download         text         null,
  file_format          text         null,
  file_size            float4       null,
  file_size_unit       text         null,
  url_info             text         null,
  created_by           text         null,
  created_at           date         null,
  modified_by          text         null,
  modified_at          date         null,
  present              text         null,
  CONSTRAINT dataproducts_pkey PRIMARY KEY (id),
  CONSTRAINT dataproducts_unique_cols UNIQUE (title, publish_year, publish_date)
);

CREATE TABLE public.protocols (
	id             serial,
	doi            varchar(250)   null,
	author         varchar(1000)  NULL,
	publisher      varchar(1000)  NULL,
	title          varchar(1000)  NOT NULL,
	publish_date   varchar(50)    NULL,
	publish_year   varchar(20)    NULL,
	coverage_type  varchar(255)   NULL,
	category       varchar(255)   NULL,
	"domain"       varchar(255)   NULL,
	purpose        varchar(255)   NULL,
	abstract       varchar(32767) NULL,
	license        varchar(32767) NULL,
	"language"     varchar(255)   NULL,
	format         varchar(100)   NULL,
	sustainability varchar(50)    NULL,
	"version"      varchar(32767) NULL,
	resolution     varchar(255)   NULL,
	"cost"         varchar(32767) NULL,
	"source"       varchar(100)   NULL,
	created_by     varchar(255)   NULL,
	created_at     varchar(50)    NULL,
	edited_by      varchar(255)   NULL,
	updated_at     varchar(50)    NULL,
	CONSTRAINT protocols_pk primary key (id),
	CONSTRAINT protocols_unique_cols unique (author, publisher, title)
);

CREATE TABLE public.relationship_types (
  id          SERIAL,
  "name"      text,
  description text,
  CONSTRAINT relationship_types_pkey PRIMARY KEY (id),
  CONSTRAINT relationship_types_unique_cols UNIQUE (name)
);

CREATE TABLE public.protocol_variable_xref (
  id                   SERIAL,
  protocol_id          INT NOT NULL,
  variable_id          int NOT NULL,
  relationship_type_id int2 not NULL,
  CONSTRAINT protocol_variable_xref_pkey PRIMARY KEY (id),
  CONSTRAINT protocol_variable_xref_unique_cols UNIQUE (protocol_id, variable_id, relationship_type_id),
  CONSTRAINT protocol_variable_xref_protocols_fk FOREIGN KEY (protocol_id) REFERENCES public.protocols(id),
  CONSTRAINT protocol_variable_xref_variables_fk FOREIGN KEY (variable_id) REFERENCES  public.variables(id),
  CONSTRAINT protocol_variable_xref_relationship_types_fk FOREIGN KEY (relationship_type_id) REFERENCES public.relationship_types(id)
);

CREATE TABLE public.dataproduct_variable_xref (
  id             SERIAL,
  dataproduct_id INT NOT NULL,
  variable_id    int NOT NULL,
  CONSTRAINT dataproduct_variable_xref_pkey PRIMARY KEY (id),
  CONSTRAINT dataproduct_variable_xref_unique_cols UNIQUE (dataproduct_id, variable_id),
  CONSTRAINT dataproduct_variable_xref_dataproducts_fk FOREIGN KEY (dataproduct_id) REFERENCES public.dataproducts(id),
  CONSTRAINT dataproduct_variable_xref_variables_fk FOREIGN KEY (variable_id) REFERENCES  public.variables(id)
);

create table public.dataproduct_datatype_xref (
  id             serial,
  dataproduct_id int4,
  datatype_id    int4,
  constraint dataproduct_datatype_xref_pkey primary key (id),
  constraint dataproduct_datatype_xref_unique_cols unique(datatype_id, dataproduct_id),
  CONSTRAINT dataproduct_datatype_xref_dataproducts_fk FOREIGN KEY (dataproduct_id) REFERENCES public.dataproducts(id),
  CONSTRAINT dataproduct_datatype_xref_datatypes_fk FOREIGN KEY (datatype_id) REFERENCES public.datatypes(id)
);

CREATE TABLE public.protocol_coverage_xref (
	id          serial,
	protocol_id int,
	coverage_id int,
	CONSTRAINT protocol_coverage_xref_pd PRIMARY KEY (id),
	CONSTRAINT protocol_coverage_xref_unique_cols UNIQUE (protocol_id, coverage_id),
	CONSTRAINT protocol_coverage_xref_protocol_fk FOREIGN KEY (protocol_id) REFERENCES protocols(id),
	CONSTRAINT protocol_coverage_xref_coverage_fk FOREIGN KEY (coverage_id) REFERENCES protocol_coverages(id)
);

CREATE TABLE public.protocol_uri_xref (
	id          serial,
	protocol_id int,
	uri_id      int,
	CONSTRAINT protocol_uri_xref_pd          PRIMARY KEY (id),
	CONSTRAINT protocol_uri_xref_unique_cols UNIQUE      (protocol_id, uri_id),
	CONSTRAINT protocol_uri_xref_protocol_fk FOREIGN KEY (protocol_id) REFERENCES protocols(id),
	CONSTRAINT protocol_uri_xref_uri_fk      FOREIGN KEY (uri_id)      REFERENCES uris(id)
);

create table public.variable_uri_xref (
  id                    serial,
  variable_id           int,
  uri_id                int,
  relationship_type_id  int,
  CONSTRAINT variable_uri_xref_pd          PRIMARY KEY (id),
  CONSTRAINT variable_uri_xref_unique_cols UNIQUE      (variable_id, uri_id),
  CONSTRAINT variable_uri_xref_variable_fk FOREIGN KEY (variable_id) REFERENCES variables(id),
  CONSTRAINT variable_uri_xref_uri_fk      FOREIGN KEY (uri_id)      REFERENCES uris(id),
  CONSTRAINT variable_uri_xref_relationship_type_fk FOREIGN KEY (relationship_type_id) REFERENCES public.relationship_types(id)
);
