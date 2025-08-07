'use client'

import { useState } from 'react'

export default function CommissionPage() {
  const [salePrice, setSalePrice] = useState('')
  const [commissionRate, setCommissionRate] = useState('2.5')
  const [splitRate, setSplitRate] = useState('50')
  const [referralFee, setReferralFee] = useState('0')

  const calculateCommission = () => {
    const price = parseFloat(salePrice) || 0
    const rate = parseFloat(commissionRate) || 0
    const split = parseFloat(splitRate) || 0
    const referral = parseFloat(referralFee) || 0

    const totalCommission = (price * rate) / 100
    const referralAmount = (totalCommission * referral) / 100
    const afterReferral = totalCommission - referralAmount
    const yourCommission = (afterReferral * split) / 100

    return {
      total: totalCommission,
      referral: referralAmount,
      afterReferral: afterReferral,
      yours: yourCommission,
      brokerage: afterReferral - yourCommission
    }
  }

  const commission = calculateCommission()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">중개 수수료 계산기</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">계산 입력</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="sale-price" className="block text-sm font-medium text-gray-700">
                  매매가격
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="sale-price"
                    id="sale-price"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="commission-rate" className="block text-sm font-medium text-gray-700">
                  수수료율 (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="commission-rate"
                    id="commission-rate"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="2.5"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="split-rate" className="block text-sm font-medium text-gray-700">
                  에이전트 분배율 (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="split-rate"
                    id="split-rate"
                    value={splitRate}
                    onChange={(e) => setSplitRate(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="referral-fee" className="block text-sm font-medium text-gray-700">
                  추천 수수료 (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="referral-fee"
                    id="referral-fee"
                    value={referralFee}
                    onChange={(e) => setReferralFee(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">계산 결과</h3>
            
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">총 수수료</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  ${commission.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </dd>
              </div>
              
              {commission.referral > 0 && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">추천 수수료</dt>
                    <dd className="text-sm text-red-600">
                      -${commission.referral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between border-t pt-4">
                    <dt className="text-sm font-medium text-gray-500">추천료 제외 수수료</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      ${commission.afterReferral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </dd>
                  </div>
                </>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <dt className="text-base font-medium text-gray-900">나의 수수료</dt>
                  <dd className="text-base font-semibold text-indigo-600">
                    ${commission.yours.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </dd>
                </div>
              </div>
              
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">중개사 수수료</dt>
                <dd className="text-sm text-gray-900">
                  ${commission.brokerage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">참고사항</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>이 계산기는 예상 수수료를 계산하기 위한 도구입니다. 실제 수수료는 계약 조건에 따라 다를 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">최근 거래 내역</h3>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">거래 내역이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}