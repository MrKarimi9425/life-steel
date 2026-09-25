import AddIcon from '@/assets/icons/iconsax/linear/add.svg?react'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ListPageLayout from '@/components/shared/ListPageLayout'
import { QueryErrorState } from '@/components/shared/QueryErrorState'
import ProductAttributesDialog from '../products/components/ProductAttributesDialog'
import ProductFilters from '../products/components/ProductFilters'
import ProductFormDialog from '../products/components/ProductFormDialog'
import ProductMediaDialog from '../products/components/ProductMediaDialog'
import ProductTable from '../products/components/ProductTable'
import { useProductsPage } from '../products/useProductsPage'
import type { Category } from '../types'
import type { ProductListItem } from '../products/products.types'

export function ProductsPage() {
    const page = useProductsPage()
    const [archiveId, setArchiveId] = useState<string | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const categoryTitle = (category: Category) =>
        category.translations.find(
            (item) => item.languageId === page.defaultLanguageId,
        )?.title ??
        category.translations[0]?.title ??
        'بدون عنوان'
    const productTitle = (product: ProductListItem) =>
        product.translations.find(
            (item) => item.languageId === page.defaultLanguageId,
        )?.title ??
        product.translations[0]?.title ??
        'بدون عنوان'
    const selectedProductId = page.dialog?.productId ?? null
    const deletingProduct = page.productsQuery.data?.items.find(
        (item) => item.id === deleteId,
    )

    return (
        <>
            <ListPageLayout
                title="محصولات"
                subtitle="مدیریت چند زبانه محصولات، دسته بندی، گالری و ویژگی ها"
                actions={
                    <Button
                        icon={<AddIcon height={20} width={20} />}
                        variant="solid"
                        onClick={() => page.openDialog('form', null)}
                    >
                        محصول جدید
                    </Button>
                }
                filters={
                    <ProductFilters
                        categories={page.categoriesQuery.data ?? []}
                        categoryId={page.categoryId}
                        categoryTitle={categoryTitle}
                        status={page.status}
                        onCategoryChange={page.setCategoryId}
                        onSearch={page.setSearch}
                        onStatusChange={page.setStatus}
                    />
                }
            >
                {page.productsQuery.isError ? (
                    <QueryErrorState
                        error={page.productsQuery.error}
                        title="دریافت محصولات با خطا مواجه شد."
                        onRetry={() => void page.productsQuery.refetch()}
                    />
                ) : (
                    <ProductTable
                        loading={page.productsQuery.isPending}
                        page={page.page}
                        pageSize={page.pageSize}
                        products={page.productsQuery.data?.items ?? []}
                        productTitle={productTitle}
                        total={page.productsQuery.data?.total ?? 0}
                        onAction={page.openDialog}
                        onArchive={setArchiveId}
                        onDelete={setDeleteId}
                        onPageChange={page.setPage}
                        onPageSizeChange={page.changePageSize}
                        onReorder={page.reorderProducts}
                        reorderPending={page.reorderMutation.isPending}
                    />
                )}
            </ListPageLayout>

            <ConfirmDialog
                isOpen={archiveId !== null}
                title="بایگانی محصول"
                type="warning"
                confirmText="بایگانی"
                confirmButtonProps={{
                    loading: page.archiveMutation.isPending,
                }}
                onCancel={() => setArchiveId(null)}
                onClose={() => setArchiveId(null)}
                onConfirm={() => {
                    if (!archiveId) return
                    page.archiveMutation.mutate(archiveId, {
                        onSuccess: () => setArchiveId(null),
                    })
                }}
            >
                این محصول بایگانی شود؟
            </ConfirmDialog>

            <ConfirmDialog
                isOpen={deleteId !== null}
                title="حذف دائمی محصول"
                type="danger"
                confirmText="حذف دائمی"
                confirmButtonProps={{
                    loading: page.deleteMutation.isPending,
                }}
                onCancel={() => setDeleteId(null)}
                onClose={() => setDeleteId(null)}
                onConfirm={() => {
                    if (!deleteId) return
                    page.deleteMutation.mutate(deleteId, {
                        onSuccess: () => setDeleteId(null),
                    })
                }}
            >
                محصول «{deletingProduct ? productTitle(deletingProduct) : ''}»
                برای همیشه حذف شود؟ این کار قابل بازگشت نیست.
            </ConfirmDialog>

            <ProductFormDialog
                categories={page.categoriesQuery.data ?? []}
                defaultLanguageId={page.defaultLanguageId}
                isOpen={page.dialog?.kind === 'form'}
                languages={page.languages}
                productId={selectedProductId}
                onClose={page.closeDialog}
                onSaved={page.refresh}
            />
            <ProductAttributesDialog
                attributes={page.attributesQuery.data ?? []}
                attributesError={page.attributesQuery.error}
                attributesLoading={page.attributesQuery.isPending}
                defaultLanguageId={page.defaultLanguageId}
                isOpen={page.dialog?.kind === 'attributes'}
                languages={page.languages}
                productId={selectedProductId}
                onClose={page.closeDialog}
                onSaved={page.refresh}
                onRetryAttributes={() => void page.attributesQuery.refetch()}
            />
            <ProductMediaDialog
                assets={page.mediaQuery.data ?? []}
                isOpen={page.dialog?.kind === 'media'}
                productId={selectedProductId}
                mediaError={page.mediaQuery.error}
                mediaLoading={page.mediaQuery.isPending}
                onClose={page.closeDialog}
                onSaved={page.refresh}
                onRetryMedia={() => void page.mediaQuery.refetch()}
            />
        </>
    )
}
