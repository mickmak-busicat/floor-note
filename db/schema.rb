# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160613113118) do

  create_table "building_reports", force: :cascade do |t|
    t.integer  "user_id",     limit: 4
    t.integer  "building_id", limit: 4
    t.text     "title",       limit: 65535
    t.text     "problem",     limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "building_reports", ["building_id"], name: "index_building_reports_on_building_id", using: :btree
  add_index "building_reports", ["user_id"], name: "index_building_reports_on_user_id", using: :btree

  create_table "building_requests", force: :cascade do |t|
    t.integer  "user_id",          limit: 4
    t.text     "building_name",    limit: 65535
    t.text     "building_address", limit: 65535
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  add_index "building_requests", ["user_id"], name: "index_building_requests_on_user_id", using: :btree

  create_table "building_sessions", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.integer  "building_id", limit: 4
    t.integer  "user_id",     limit: 4
    t.text     "payload",     limit: 65535
    t.integer  "status",      limit: 4
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "building_sessions", ["building_id"], name: "index_building_sessions_on_building_id", using: :btree
  add_index "building_sessions", ["user_id"], name: "index_building_sessions_on_user_id", using: :btree

  create_table "buildings", force: :cascade do |t|
    t.text     "name",       limit: 65535
    t.text     "address",    limit: 65535
    t.text     "tag",        limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "floor_objects", force: :cascade do |t|
    t.float    "x",              limit: 24
    t.float    "y",              limit: 24
    t.string   "label",          limit: 255
    t.integer  "floor_id",       limit: 4
    t.string   "object_type",    limit: 255
    t.float    "width",          limit: 24
    t.float    "height",         limit: 24
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.string   "direction",      limit: 10
    t.integer  "default_status", limit: 2,   default: 0
  end

  add_index "floor_objects", ["floor_id"], name: "index_floor_objects_on_floor_id", using: :btree

  create_table "floors", force: :cascade do |t|
    t.text     "name",        limit: 65535
    t.integer  "seq",         limit: 4
    t.integer  "building_id", limit: 4
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "floors", ["building_id"], name: "index_floors_on_building_id", using: :btree

  create_table "rates", force: :cascade do |t|
    t.integer  "rating",          limit: 4
    t.integer  "floor_object_id", limit: 4
    t.integer  "user_id",         limit: 4
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
    t.integer  "status",          limit: 1, default: 0
  end

  add_index "rates", ["floor_object_id"], name: "index_rates_on_floor_object_id", using: :btree
  add_index "rates", ["user_id"], name: "index_rates_on_user_id", using: :btree

  create_table "reports", force: :cascade do |t|
    t.integer  "building_id",     limit: 4
    t.integer  "floor_id",        limit: 4
    t.integer  "floor_object_id", limit: 4
    t.integer  "user_id",         limit: 4
    t.text     "reason",          limit: 65535
    t.text     "comment",         limit: 65535
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  add_index "reports", ["building_id"], name: "index_reports_on_building_id", using: :btree
  add_index "reports", ["floor_id"], name: "index_reports_on_floor_id", using: :btree
  add_index "reports", ["floor_object_id"], name: "index_reports_on_floor_object_id", using: :btree
  add_index "reports", ["user_id"], name: "index_reports_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          limit: 4,   default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
    t.datetime "created_at",                                      null: false
    t.datetime "updated_at",                                      null: false
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  add_foreign_key "building_reports", "buildings"
  add_foreign_key "building_reports", "users"
  add_foreign_key "building_requests", "users"
  add_foreign_key "building_sessions", "buildings"
  add_foreign_key "building_sessions", "users"
  add_foreign_key "floor_objects", "floors"
  add_foreign_key "floors", "buildings"
  add_foreign_key "rates", "floor_objects"
  add_foreign_key "rates", "users"
  add_foreign_key "reports", "buildings"
  add_foreign_key "reports", "floor_objects"
  add_foreign_key "reports", "floors"
  add_foreign_key "reports", "users"
end
