'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Check, ChevronRight, MapPin, MapPinned, PencilLine, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import { SubPage } from '@/components/mini/sub-page'
import { cn } from '@/lib/utils'

export type AddressView = 'list' | 'add' | 'edit' | 'delete' | 'empty'

type Tag = '家' | '公司' | '父母家'
type Region = [string, string, string]

export type ManagedAddress = {
  id: string
  name: string
  phone: string
  region: Region
  street: string
  tag?: Tag
  isDefault: boolean
}

const MAX_ADDRESSES = 20
const tags: Tag[] = ['家', '公司', '父母家']

const regionTree: Record<string, Record<string, string[]>> = {
  浙江省: { 杭州市: ['西湖区', '滨江区', '上城区', '拱墅区'], 绍兴市: ['越城区', '柯桥区'], 宁波市: ['鄞州区', '海曙区'] },
  上海市: { 上海市: ['浦东新区', '徐汇区', '静安区'] },
  北京市: { 北京市: ['朝阳区', '海淀区', '东城区'] },
  广东省: { 广州市: ['天河区', '越秀区'], 深圳市: ['南山区', '福田区'] },
}

const initialAddresses: ManagedAddress[] = [
  {
    id: 'home',
    name: '王建国',
    phone: '138****6721',
    region: ['浙江省', '杭州市', '西湖区'],
    street: '文三路 478 号华星时代广场 A 座 1206',
    tag: '家',
    isDefault: true,
  },
  {
    id: 'work',
    name: '王建国',
    phone: '138****6721',
    region: ['浙江省', '杭州市', '滨江区'],
    street: '网商路 699 号 3 号楼 5 层',
    tag: '公司',
    isDefault: false,
  },
  {
    id: 'parent',
    name: '李秀兰',
    phone: '139****2048',
    region: ['浙江省', '绍兴市', '越城区'],
    street: '中兴中路 128 号 2 单元 302',
    tag: '父母家',
    isDefault: false,
  },
]

/** 有待发货采样盒订单正在使用的地址，不可删除 */
const shippingAddressIds = new Set(['work'])

export const savedAddresses = initialAddresses

export const regionText = (r: Region) => (r[0] === r[1] ? `${r[0]} ${r[2]}` : r.join(' '))

type Props = {
  onBack: () => void
  initialView?: AddressView
}

export function AddressManageScreen({ onBack, initialView = 'list' }: Props) {
  const [list, setList] = useState<ManagedAddress[]>(initialView === 'empty' ? [] : initialAddresses)
  const [form, setForm] = useState<{ target?: ManagedAddress } | null>(
    initialView === 'add' ? {} : initialView === 'edit' ? { target: initialAddresses[0] } : null,
  )
  const [pendingDelete, setPendingDelete] = useState<ManagedAddress | null>(
    initialView === 'delete' ? initialAddresses[2] : null,
  )
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const full = list.length >= MAX_ADDRESSES

  const openAdd = () => {
    if (full) return setToast(`最多保存 ${MAX_ADDRESSES} 个地址`)
    setForm({})
  }

  const withDefault = (items: ManagedAddress[], defaultId?: string) => {
    const id = defaultId ?? items.find((a) => a.isDefault)?.id ?? items[0]?.id
    return items
      .map((a) => ({ ...a, isDefault: a.id === id }))
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
  }

  const save = (a: ManagedAddress) => {
    const exists = list.some((m) => m.id === a.id)
    const next = exists ? list.map((m) => (m.id === a.id ? a : m)) : [...list, a]
    setList(withDefault(next, a.isDefault ? a.id : undefined))
    setForm(null)
    setToast(exists ? '修改已保存' : '添加成功')
  }

  const setDefault = (id: string) => {
    setList((l) => withDefault(l, id))
    setToast('已设为默认地址')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    setList((l) => withDefault(l.filter((m) => m.id !== pendingDelete.id)))
    setPendingDelete(null)
    setToast('已删除')
  }

  const blocked = !!pendingDelete && shippingAddressIds.has(pendingDelete.id)

  return (
    <SubPage title="地址管理" titleId="address-manage-title" onBack={onBack}>
      {list.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
            <p className="flex items-center justify-between px-1 text-[12px] text-muted-foreground">
              <span>
                已保存 <span className="tabular-nums text-foreground">{list.length}</span> / {MAX_ADDRESSES} 个
              </span>
              <span>用于邮寄采样盒</span>
            </p>

            <ul className="mt-2 flex flex-col gap-2.5">
              {list.map((a) => (
                <li key={a.id} className="rounded-2xl bg-white p-3.5">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                        a.isDefault ? 'bg-primary text-primary-foreground' : 'bg-[#eef5ff] text-primary',
                      )}
                      aria-hidden="true"
                    >
                      <MapPin className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[15px] font-semibold text-foreground">{a.name}</span>
                        <span className="text-[13px] tabular-nums text-muted-foreground">{a.phone}</span>
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1">
                        {a.isDefault && (
                          <span className="rounded bg-primary px-1.5 py-px text-[11px] text-primary-foreground">默认</span>
                        )}
                        {a.tag && (
                          <span className="rounded bg-[#eef5ff] px-1.5 py-px text-[11px] text-primary">{a.tag}</span>
                        )}
                        <span className="text-[12px] text-muted-foreground">{regionText(a.region)}</span>
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-foreground">{a.street}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={a.isDefault}
                      onClick={() => !a.isDefault && setDefault(a.id)}
                      className="flex items-center gap-1.5 text-[12px]"
                    >
                      <span
                        className={cn(
                          'flex size-4 items-center justify-center rounded-full border',
                          a.isDefault ? 'border-primary bg-primary text-primary-foreground' : 'border-[#c4ccda]',
                        )}
                        aria-hidden="true"
                      >
                        {a.isDefault && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className={a.isDefault ? 'text-primary' : 'text-muted-foreground'}>
                        {a.isDefault ? '默认地址' : '设为默认'}
                      </span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingDelete(a)}
                        className="flex h-7 items-center gap-1 rounded-full border border-border px-3 text-[12px] text-foreground"
                        aria-label={`删除 ${a.name} 的地址`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        删除
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ target: a })}
                        className="flex h-7 items-center gap-1 rounded-full border border-primary px-3 text-[12px] text-primary"
                        aria-label={`编辑 ${a.name} 的地址`}
                      >
                        <PencilLine className="size-3.5" aria-hidden="true" />
                        编辑
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-3 flex items-start gap-1.5 px-1 text-[11px] leading-[18px] text-muted-foreground">
              <ShieldCheck className="mt-px size-3.5 shrink-0 text-primary" aria-hidden="true" />
              地址仅用于自采样订单的采样盒邮寄，修改或删除不影响已发货的订单。
            </p>
          </div>

          <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
            <button
              type="button"
              onClick={openAdd}
              aria-disabled={full}
              className={cn(
                'flex h-10 w-full items-center justify-center gap-1 rounded-full text-[14px] font-medium',
                full ? 'bg-[#e6ebf3] text-muted-foreground' : 'bg-primary text-primary-foreground active:opacity-90',
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              新增收货地址
            </button>
          </div>
        </>
      )}

      {pendingDelete && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-8">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-address-title"
            aria-describedby="delete-address-desc"
            className="w-full rounded-2xl bg-white px-5 pb-4 pt-5 text-center motion-safe:animate-in motion-safe:zoom-in-95"
          >
            <span
              className={cn(
                'mx-auto flex size-11 items-center justify-center rounded-full',
                blocked ? 'bg-[#fff4e5] text-[#c27a12]' : 'bg-[#fdecea] text-[#e5603a]',
              )}
              aria-hidden="true"
            >
              {blocked ? <AlertTriangle className="size-5" /> : <Trash2 className="size-5" />}
            </span>
            <h2 id="delete-address-title" className="mt-3 text-[16px] font-semibold text-foreground">
              {blocked ? '暂不可删除' : '确定删除该地址？'}
            </h2>
            {!blocked && (
              <p className="mt-2 rounded-xl bg-[#f6f8fc] px-3 py-2 text-left text-[12px] leading-[18px] text-foreground">
                {pendingDelete.name} <span className="tabular-nums">{pendingDelete.phone}</span>
                <br />
                <span className="text-muted-foreground">
                  {regionText(pendingDelete.region)} {pendingDelete.street}
                </span>
              </p>
            )}
            <p id="delete-address-desc" className="mt-2 text-[13px] leading-5 text-muted-foreground">
              {blocked
                ? '该地址有待发货的采样盒订单，请在订单发货后再删除。'
                : pendingDelete.isDefault
                  ? '这是默认地址，删除后将自动把下一个地址设为默认。'
                  : '删除后不可恢复，不影响已下单的订单。'}
            </p>
            {blocked ? (
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="mt-4 h-10 w-full rounded-full bg-primary text-[14px] font-medium text-primary-foreground"
              >
                我知道了
              </button>
            ) : (
              <div className="mt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="h-10 flex-1 rounded-full border border-border text-[14px] text-foreground"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="h-10 flex-1 rounded-full bg-[#e5603a] text-[14px] font-medium text-white"
                >
                  确认删除
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {form && (
        <AddressFormScreen
          initial={form.target}
          forceDefault={list.length === 0}
          onBack={() => setForm(null)}
          onSave={save}
        />
      )}

      {toast && (
        <p
          role="status"
          className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/75 px-4 py-2 text-[13px] text-white"
        >
          {toast}
        </p>
      )}
    </SubPage>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center px-8 pt-20 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-[#e3eeff]" aria-hidden="true">
        <MapPinned className="size-11 text-primary" strokeWidth={1.4} />
      </span>
      <h2 className="mt-5 text-[16px] font-semibold text-foreground">还没有收货地址</h2>
      <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
        添加常用地址，选择自采样检测时采样盒将寄送到该地址。
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 flex h-10 items-center gap-1 rounded-full bg-primary px-8 text-[14px] font-medium text-primary-foreground active:opacity-90"
      >
        <Plus className="size-4" aria-hidden="true" />
        新增收货地址
      </button>
    </div>
  )
}

type Errors = Partial<Record<'name' | 'phone' | 'region' | 'street', string>>

function AddressFormScreen({
  initial,
  forceDefault,
  onBack,
  onSave,
}: {
  initial?: ManagedAddress
  forceDefault: boolean
  onBack: () => void
  onSave: (a: ManagedAddress) => void
}) {
  const editing = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [region, setRegion] = useState<Region | null>(initial?.region ?? null)
  const [street, setStreet] = useState(initial?.street ?? '')
  const [tag, setTag] = useState<Tag | undefined>(initial?.tag)
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? forceDefault)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const clear = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: undefined }))
  const masked = phone.includes('*')

  const save = () => {
    const next: Errors = {}
    if (!/^[\u4e00-\u9fa5·a-zA-Z]{2,20}$/.test(name.trim())) next.name = '请填写 2–20 位收货人姓名'
    if (!masked && !/^1\d{10}$/.test(phone)) next.phone = '请输入 11 位手机号'
    if (!region) next.region = '请选择所在地区'
    if (street.trim().length < 5) next.street = '请填写街道、门牌号等详细地址（至少 5 个字）'
    setErrors(next)
    if (Object.keys(next).length || !region) return
    onSave({
      id: initial?.id ?? `a-${Date.now()}`,
      name: name.trim(),
      phone: masked ? phone : `${phone.slice(0, 3)}****${phone.slice(7)}`,
      region,
      street: street.trim(),
      tag,
      isDefault,
    })
  }

  return (
    <SubPage title={editing ? '编辑收货地址' : '新增收货地址'} titleId="address-form-title" onBack={onBack}>
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2.5 [scrollbar-width:none]">
        <section aria-label="收货信息" className="rounded-2xl bg-white px-3.5">
          <Row label="收货人" error={errors.name}>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, 20))
                clear('name')
              }}
              placeholder="请输入收货人姓名"
              aria-invalid={!!errors.name}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-[#a9b3c6]"
            />
          </Row>
          <Row label="手机号" error={errors.phone}>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onFocus={() => masked && setPhone('')}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))
                clear('phone')
              }}
              placeholder="用于快递员联系"
              aria-invalid={!!errors.phone}
              className="min-w-0 flex-1 bg-transparent text-[14px] tabular-nums text-foreground outline-none placeholder:text-[#a9b3c6]"
            />
          </Row>
          <div className="border-b border-border py-1">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              aria-invalid={!!errors.region}
              className="flex h-11 w-full items-center gap-3 text-left"
            >
              <span className="w-[68px] shrink-0 text-[14px] text-foreground">所在地区</span>
              <span className={cn('min-w-0 flex-1 truncate text-[14px]', region ? 'text-foreground' : 'text-[#a9b3c6]')}>
                {region ? region.join(' ') : '省 / 市 / 区'}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
            <FieldError msg={errors.region} />
          </div>
          <div className="py-2.5">
            <label className="flex gap-3">
              <span className="w-[68px] shrink-0 pt-0.5 text-[14px] text-foreground">详细地址</span>
              <textarea
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value.slice(0, 60))
                  clear('street')
                }}
                rows={2}
                placeholder="街道、楼牌号、单元室等"
                aria-invalid={!!errors.street}
                className="min-w-0 flex-1 resize-none bg-transparent text-[14px] leading-5 text-foreground outline-none placeholder:text-[#a9b3c6]"
              />
            </label>
            <FieldError msg={errors.street} />
          </div>
        </section>

        <section aria-label="地址设置" className="mt-2.5 rounded-2xl bg-white px-3.5">
          <div className="flex h-12 items-center gap-3 border-b border-border">
            <span id="address-tag-label" className="w-[68px] shrink-0 text-[14px] text-foreground">
              标签
            </span>
            <div role="radiogroup" aria-labelledby="address-tag-label" className="flex gap-2">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tag === t}
                  onClick={() => setTag(tag === t ? undefined : t)}
                  className={cn(
                    'h-7 rounded-full border px-3 text-[12px] transition-colors',
                    tag === t ? 'border-primary bg-[#eef5ff] font-medium text-primary' : 'border-border text-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-14 items-center justify-between">
            <span>
              <span id="address-default-label" className="block text-[14px] text-foreground">
                设为默认地址
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {forceDefault ? '首个地址将自动设为默认' : '下单时优先使用该地址'}
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isDefault}
              aria-labelledby="address-default-label"
              disabled={forceDefault || initial?.isDefault}
              onClick={() => setIsDefault((v) => !v)}
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60',
                isDefault ? 'bg-primary' : 'bg-[#d5dbe6]',
              )}
            >
              <span
                className={cn(
                  'absolute left-0 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
                  isDefault ? 'translate-x-[22px]' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>
        </section>

        <p className="mt-3 flex items-start gap-1.5 px-1 text-[11px] leading-[18px] text-muted-foreground">
          <ShieldCheck className="mt-px size-3.5 shrink-0 text-primary" aria-hidden="true" />
          采样盒需本人签收，请确保收货人与手机号真实有效。
        </p>
      </div>

      <div className="shrink-0 border-t border-border bg-white px-4 pb-6 pt-2.5">
        <button
          type="button"
          onClick={save}
          className="h-10 w-full rounded-full bg-primary text-[14px] font-medium text-primary-foreground active:opacity-90"
        >
          {editing ? '保存修改' : '保存地址'}
        </button>
      </div>

      {pickerOpen && (
        <RegionPicker
          initial={region}
          onClose={() => setPickerOpen(false)}
          onConfirm={(r) => {
            setRegion(r)
            clear('region')
            setPickerOpen(false)
          }}
        />
      )}
    </SubPage>
  )
}

function RegionPicker({
  initial,
  onClose,
  onConfirm,
}: {
  initial: Region | null
  onClose: () => void
  onConfirm: (r: Region) => void
}) {
  const provinces = Object.keys(regionTree)
  const [province, setProvince] = useState(initial?.[0] ?? provinces[0])
  const cities = Object.keys(regionTree[province])
  const [city, setCity] = useState(initial?.[1] ?? cities[0])
  const districts = regionTree[province][city] ?? []
  const [district, setDistrict] = useState(initial?.[2] ?? districts[0])

  const pickProvince = (p: string) => {
    setProvince(p)
    const c = Object.keys(regionTree[p])[0]
    setCity(c)
    setDistrict(regionTree[p][c][0])
  }
  const pickCity = (c: string) => {
    setCity(c)
    setDistrict(regionTree[province][c][0])
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="region-picker-title"
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-2xl bg-white pb-6 motion-safe:animate-in motion-safe:slide-in-from-bottom"
      >
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <button type="button" onClick={onClose} aria-label="关闭" className="text-muted-foreground">
            <X className="size-5" aria-hidden="true" />
          </button>
          <h2 id="region-picker-title" className="text-[15px] font-semibold text-foreground">
            选择所在地区
          </h2>
          <button
            type="button"
            onClick={() => onConfirm([province, city, district])}
            className="text-[14px] font-medium text-primary"
          >
            确定
          </button>
        </div>
        <div className="grid h-56 grid-cols-3">
          <Column label="省份" items={provinces} value={province} onPick={pickProvince} />
          <Column label="城市" items={cities} value={city} onPick={pickCity} />
          <Column label="区县" items={districts} value={district} onPick={setDistrict} />
        </div>
      </div>
    </div>
  )
}

function Column({
  label,
  items,
  value,
  onPick,
}: {
  label: string
  items: string[]
  value: string
  onPick: (v: string) => void
}) {
  return (
    <ul role="listbox" aria-label={label} className="overflow-y-auto py-2 [scrollbar-width:none]">
      {items.map((i) => (
        <li key={i} role="option" aria-selected={i === value}>
          <button
            type="button"
            onClick={() => onPick(i)}
            className={cn(
              'h-10 w-full px-2 text-center text-[14px]',
              i === value ? 'bg-[#eef5ff] font-medium text-primary' : 'text-foreground',
            )}
          >
            {i}
          </button>
        </li>
      ))}
    </ul>
  )
}

function Row({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-1">
      <label className="flex h-11 items-center gap-3">
        <span className="w-[68px] shrink-0 text-[14px] text-foreground">{label}</span>
        {children}
      </label>
      <FieldError msg={error} />
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="pb-1.5 pl-[80px] text-[11px] text-[#e5603a]">
      {msg}
    </p>
  )
}
